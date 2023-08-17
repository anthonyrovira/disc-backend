module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^app/(.*)$': '<rootDir>/src/app/$1',
    '^assets/(.*)$': '<rootDir>/src/assets/$1',
    '^auth/(.*)$': '<rootDir>/src/auth/$1',
    '^core/(.*)$': '<rootDir>/src/core/$1',
    '^framework/(.*)$': '<rootDir>/src/framework/$1',
    '^question/(.*)$': '<rootDir>/src/question/$1',
    '^user/(.*)$': '<rootDir>/src/user/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
  },
};
