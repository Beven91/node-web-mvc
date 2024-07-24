
export default interface JoinPoint {

  getThis(): object

  getTarget(): object

  getArgs(): object[]

  getSignature(): string

}