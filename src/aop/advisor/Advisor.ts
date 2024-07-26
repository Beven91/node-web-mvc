import Advice from '../advice/Advice';

export default abstract class Advisor {
  abstract getAdvice(): Advice;
}
