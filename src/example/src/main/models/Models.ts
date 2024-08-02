import { ApiModel, ModelAttribute } from 'node-web-mvc';

class Geometry {
  @ModelAttribute
  type: string;

  @ModelAttribute
  coordinates: number[][][];
}

class FeatureProperty {
  @ModelAttribute
  MAPBLKLOT: string;
  @ModelAttribute
  BLKLOT: string;
  @ModelAttribute
  BLOCK_NUM: string;
  @ModelAttribute
  LOT_NUM: string;
  @ModelAttribute
  FROM_ST: string;
  @ModelAttribute
  STREET: string;
}


class Feature {
  @ModelAttribute
  type: string;

  @ModelAttribute
  properties: FeatureProperty;

  @ModelAttribute
  geometry: Geometry;
}


@ApiModel
class City {
  @ModelAttribute
  type: string;

  @ModelAttribute({ itemType: Feature })
  features: Feature[];
}

export default City;
