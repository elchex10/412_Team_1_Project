#!/usr/bin/env python3
"""
Run the heart-rate calculator JSONL eval cases against the local Node server.

The server is started and stopped by this script, so application source files are
not changed and the same API used by the Sprint 1-4 calculator is exercised.
"""

import argparse
import json
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
CASES_PATH = REPO_ROOT / "evals" / "cases.jsonl"


def read_cases(path):
    cases = []
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            if not line.strip():
                continue
            try:
                case = json.loads(line)
            except json.JSONDecodeError as error:
                raise ValueError(
                    f"{path.name}:{line_number}: invalid JSON: {error.msg}"
                ) from error

            missing = {"id", "kind", "prompt", "query", "expected"} - case.keys()
            if missing:
                raise ValueError(
                    f"{path.name}:{line_number}: missing fields: "
                    f"{', '.join(sorted(missing))}"
                )
            cases.append(case)
    return cases


def wait_for_server(url, timeout_seconds=10):
    deadline = time.monotonic() + timeout_seconds
    last_error = None
    while time.monotonic() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=1) as response:
                if response.status == 200:
                    return
        except Exception as error:
            last_error = error
        time.sleep(0.1)
    raise RuntimeError(f"server did not become ready: {last_error}")


def request_calculation(base_url, query):
    params = urllib.parse.urlencode(query)
    url = f"{base_url}/api/calculate?{params}"
    try:
        with urllib.request.urlopen(url, timeout=5) as response:
            status = response.status
            body = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        status = error.code
        body = json.loads(error.read().decode("utf-8"))
    return status, body


def compare_expected(case_id, body, expected):
    failures = []
    for key, expected_value in expected.items():
        if key == "error_contains":
            actual = body.get("error", "")
            if expected_value not in actual:
                failures.append(
                    f"{key}: expected {expected_value!r} in {actual!r}"
                )
        elif key == "maximumHeartRate":
            actual = body.get("result")
            if actual != expected_value:
                failures.append(
                    f"{key}: expected {expected_value!r}, got {actual!r}"
                )
        elif key in ("moderateZone", "vigorousZone"):
            actual = body.get(key)
            if not isinstance(actual, dict):
                failures.append(f"{key}: missing or invalid response value")
            else:
                for bound in ("min", "max"):
                    if abs(float(actual.get(bound)) - float(expected_value[bound])) > 1e-9:
                        failures.append(
                            f"{key}.{bound}: expected "
                            f"{expected_value[bound]!r}, got {actual.get(bound)!r}"
                        )
        elif key not in body:
            failures.append(f"{key}: missing from response")
        elif body[key] != expected_value:
            failures.append(
                f"{key}: expected {expected_value!r}, got {body[key]!r}"
            )
    return failures


def main():
    parser = argparse.ArgumentParser(
        description="Run JSONL eval cases against the heart-rate calculator."
    )
    parser.add_argument(
        "--cases",
        type=Path,
        default=CASES_PATH,
        help="Path to the cases JSONL file.",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=18080,
        help="Local port used by the temporary Node.js server.",
    )
    args = parser.parse_args()

    cases = read_cases(args.cases)
    allowed_kinds = {
        "happy_path",
        "edge_case",
        "out_of_scope",
        "adversarial",
    }
    for case in cases:
        if case["kind"] not in allowed_kinds:
            raise ValueError(
                f"case {case['id']}: unsupported kind {case['kind']!r}"
            )

    base_url = f"http://127.0.0.1:{args.port}"
    process = subprocess.Popen(
        ["node", "server.js"],
        cwd=REPO_ROOT,
        env={**__import__("os").environ, "PORT": str(args.port)},
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )

    passed = 0
    failed = 0
    try:
        wait_for_server(base_url + "/", timeout_seconds=10)
        print(f"Running {len(cases)} cases from {args.cases}")

        for case in cases:
            expected = dict(case["expected"])
            expected_status = expected.pop("status")
            try:
                status, body = request_calculation(base_url, case["query"])
                failures = []
                if status != expected_status:
                    failures.append(
                        f"status: expected {expected_status}, got {status}"
                    )
                failures.extend(compare_expected(case["id"], body, expected))

                if failures:
                    failed += 1
                    print(f"FAIL {case['id']} [{case['kind']}]")
                    for failure in failures:
                        print(f"  - {failure}")
                else:
                    passed += 1
                    print(f"PASS {case['id']} [{case['kind']}]")
            except Exception as error:
                failed += 1
                print(f"FAIL {case['id']} [{case['kind']}]")
                print(f"  - {error}")
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)

    print(f"\nSummary: {passed} passed, {failed} failed")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())