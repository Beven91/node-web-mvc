
export default interface JoinPoint {

  getThis(): object

  getTarget(): object

  getArgs(): object[]

  getSignature(): string

// eslint-disable-next-line semi
}
