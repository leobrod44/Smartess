const nextJest=require('next/jest')

const { testEnvironment } = require("jsdom")

const createJestConfig= nextJest({
    dir: './',
})

const config={
    setupFilesAfterEnv:['<rootDir>/jest.setup.js'],
    testEnvironment:'jsdom',
    preset:'ts-jest'
}

module.exports= createJestConfig(config)