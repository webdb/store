module.exports = {
  extends: ['airbnb-base', 'prettier'],
  rules: {
    'no-bitwise': 'off',
    'no-param-reassign': 'off',
    'consistent-return': 'off',
    'no-restricted-syntax': 'off',
    camelcase: 'off',
    'no-plusplus': 'off',
    'max-len': 'off',
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-await-in-loop': 'off'
  },
  env: {
    jasmine: true
  }
};
