module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^assets/(.*)$': '<rootDir>/src/assets/$1',
    '^services/(.*)$': '<rootDir>/src/services/$1',
    '^dtos/(.*)$': '<rootDir>/src/dtos/$1',
    '^controllers/(.*)$': '<rootDir>/src/controllers/$1',
  },
};
