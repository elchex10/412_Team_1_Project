function validateRequiredInputs(inputs, requiredFields = ["age"]) {
    const missingFields = requiredFields.filter((field) => {
        const value = inputs[field];

        return (
            value === undefined ||
            value === null ||
            String(value).trim() === ""
        );
    });

    return {
        isValid: missingFields.length === 0,
        missingFields
    };
}

function calculateWhenInputsAreValid(
    inputs,
    calculate,
    requiredFields = ["age"]
) {
    const validation = validateRequiredInputs(inputs, requiredFields);

    // Do not calculate when required information is missing.
    if (!validation.isValid) {
        return {
            isValid: false,
            missingFields: validation.missingFields,
            result: null
        };
    }

    // Proceed only when all required fields have been supplied.
    return {
        isValid: true,
        missingFields: [],
        result: calculate(inputs)
    };
}

module.exports = {
    validateRequiredInputs,
    calculateWhenInputsAreValid
};