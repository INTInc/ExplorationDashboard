module.exports = {
    root: true,
    env: {
        node: true
    },
    'extends': [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/typescript/recommended'
    ],
    parserOptions: {
        ecmaVersion: 2020
    },
    rules: {
        'block-scoped-var': 2,
        'operator-linebreak': [2, 'after'],
        'no-extra-semi': 2,
        'dot-location': [2, 'property'],
        'comma-dangle': [2, 'never'],
        'no-else-return': 2,
        'yoda': [2, 'never', {
            'exceptRange': true
        }],
        'brace-style': [2, '1tbs', {
            'allowSingleLine': false
        }],
        'indent': [2, 4, {
            'SwitchCase': 1
        }],
        'semi-spacing': [2, {
            'before': false,
            'after': true
        }],
        'space-infix-ops': [2, {
            'int32Hint': false
        }],
        'comma-spacing': [2, {
            'before': false,
            'after': true
        }],
        'key-spacing': [2, {
            'beforeColon': false,
            'afterColon': true
        }],
        'space-before-function-paren': [2, {
            asyncArrow: 'always',
            anonymous: 'always',
            named: 'always'
        }],
        'eqeqeq': [2, 'smart'],
        'no-var': 0,
        'one-var': 0,
        'spaced-comment': 1,
        'prefer-spread': 0,
        'prefer-rest-params': 0,
        'linebreak-style': 0,
        'no-delete-var': 2,
        'no-unreachable': 2,
        'no-redeclare': 2,
        'no-return-assign': [2, 'except-parens'],
        'no-undef': 2,
        'no-use-before-define': [2, 'nofunc'],
        'consistent-this': [2, 'self'],
        'consistent-return': [2, {
            'treatUndefinedAsUnspecified': false
        }],
        'max-params': [1, 6],
        'max-statements': [1, 50, {
            'ignoreTopLevelFunctions': true
        }],
        'max-len': [2, {
            code: 140,
            ignoreComments: true,
            ignorePattern: 'geotoolkit.'
        }],
        'guard-for-in': 0,
        'new-cap': 2,
        'no-loop-func': 2,
        'no-console': process.env.NODE_ENV === 'production' ? 2 : 0
    }
};
