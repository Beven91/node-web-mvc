import CorsConfiguration from './CorsConfiguration';
import CorsRegistration from './CorsRegistration';

export default class CorsRegistry {
  private readonly registrations: CorsRegistration[];

  constructor() {
    this.registrations = [];
  }

  addMapping(pattern: string) {
    const registration = new CorsRegistration(pattern);
    this.registrations.push(registration);
    return registration;
  }

  getCorsConfigurations() {
    const configurations = new Map<string, CorsConfiguration>();
    for (const registration of this.registrations) {
      configurations.set(registration.getPathPattern(), registration.getCorsConfiguration());
    }
    return configurations;
  }
}
