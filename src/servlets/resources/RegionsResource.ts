import Resource from "./Resource";
import ResourceRegion from "./ResourceRegion";

export default class RegionsResource {

  public readonly regions: ResourceRegion[];

  public readonly resource: Resource

  constructor(regions: ResourceRegion[], resource: Resource) {
    this.regions = regions;
    this.resource = resource;
  }
}
