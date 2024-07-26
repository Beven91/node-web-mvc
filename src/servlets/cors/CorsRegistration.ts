import CorsConfiguration from './CorsConfiguration';

export default class CorsRegistration {
  private readonly pathPattern: string;

  private readonly config: CorsConfiguration;

  constructor(pathPattern: string) {
    this.pathPattern = pathPattern;
    this.config = new CorsConfiguration().applyPermitDefaultValues();
  }

  allowedOrigins(...origins: string[]) {
    this.config.origins = origins || [];
    return this;
  }


  allowedMethods(...methods: string[]) {
    this.config.methods = methods || [];
    return this;
  }

  allowedHeaders(...headers: string[]) {
    this.config.allowedHeaders = headers || [];
    return this;
  }

  exposedHeaders(...headers: string[]) {
    this.config.exposedHeaders = headers || [];
    return this;
  }

  allowCredentials(allowCredentials: boolean) {
    this.config.allowCredentials = allowCredentials;
    return this;
  }

  allowOriginPatterns(...patterns: RegExp[]) {
    this.config.originPatterns = patterns || [];
  }

  allowPrivateNetwork(allowPrivateNetwork: boolean) {
    this.config.allowPrivateNetwork = allowPrivateNetwork;
    return this;
  }

  maxAge(maxAge: number) {
    this.config.maxAge = maxAge;
    return this;
  }

  getPathPattern() {
    return this.pathPattern;
  }

  getCorsConfiguration() {
    return this.config;
  }
}
