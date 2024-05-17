import Serialization from "./Serialization";
import fs from 'fs';

const s = {
  "special_characters_string": "包含特殊字符的字符串: \" \\ / \b \f \n \r \t",
  "string": "这是一个字符串",
  "number": 123,
  "float": 123.45,
  "boolean_true": true,
  "boolean_false": false,
  "null_value": null,
  "object": {
    "key1": "value1",
    "key2": "value2",
    "nested_object": {
      "nested_key1": "nested_value1",
      "nested_key2": 456
    }
  },
  "array": [
    "元素1",
    2,
    3.14,
    true,
    null,
    {
      "nested_key": "nested_value"
    },
    [
      "nested_array_element1",
      42,
      {
        "deeply_nested_key": "deeply_nested_value"
      }
    ]
  ],
  "big_number": 123456789012345678901234567890,
  "nested_array": [
    [
      [
        [
          [
            "deeply_nested_array"
          ]
        ]
      ]
    ]
  ]
}


// const str = JSON.stringify(s,null,2);
const str = fs.readFileSync('citylots.json').toString('utf-8');

const start = performance.now();
const serialization = new Serialization();
const data = serialization.deserialize(str, Object);
console.log(performance.now() - start);