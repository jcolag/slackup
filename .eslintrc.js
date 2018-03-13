module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": [
        "eslint:all",
        "plugin:react/all"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true
        },
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "one-var": [
            "error",
            "never"
        ],
        "padded-blocks": [
            "error",
            "never"
        ],
        "comma-dangle": [
            "error",
            "always-multiline"
        ],
        "lines-around-comment": [
            "error", {
                "allowBlockStart": true
            }
        ],
        "no-sync": [
            "off"
        ],
        "multiline-ternary": [
            "off"
        ],
        "no-ternary": [
            "off"
        ],
        "react/jsx-no-literals": [
            "off"
        ],
        "react/jsx-handler-names": [
            "off"
        ],
        "react/jsx-max-depth": [
            "off"
        ],
        "class-methods-use-this": [
            "off"
        ],
        "no-prototype-builtins": [
            "off"
        ],
        "id-length": [
            "off"
        ],
        "no-magic-numbers": [
            "error",
            {
                "ignore": [0, 1]
            }
        ],
        "no-confusing-arrow": [
            "error",
            {
                "allowParens": true
            }
        ],
        "no-extra-parens": [
            "error",
            "all",
            {
                "ignoreJSX": "all",
                "enforceForArrowConditionals": false
            }
        ],
        "object-curly-spacing": [
            "error",
            "always"
        ],
        "func-style": [
            "error",
            "declaration",
            {
                "allowArrowFunctions": true
            }
        ],
        "space-before-function-paren": [
            "error",
            "never"
        ],
        "eol-last": [
            "off"
        ],
        "function-paren-newline": [
            "off"
        ]
    }
};