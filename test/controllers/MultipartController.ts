import { RequestMapping, RequestBody, Autowired } from '../../src/index';
import { Api, ApiOperation, ApiImplicitParams, RequestParam, MultipartFile } from '../../src/index';
import { PostMapping } from '../../src/index';
import ModelAndView from '../../src/servlets/models/ModelAndView';
import GetMapping from '../../src/servlets/annotations/mapping/GetMapping';

@Api({ description: 'multipart控制器' })
@RequestMapping('/multipart')
export default class MultipartController {

  @Autowired
  public userInfo;

  @Autowired
  say(){

  }
  
  @ApiOperation({ value: '上传文件', notes: '上传证书文件' })
  @ApiImplicitParams([
    RequestParam({ value: 'file', desc: '证书', required: true, dataType: MultipartFile }),
    RequestParam({ value: 'desc', desc: '描述', required: true, paramType: 'formData' }),
    RequestParam({ value: 'id', desc: '用户id', required: true })
  ])
  @PostMapping('/upload')
  async upload(file: MultipartFile, desc, id) {
    await file.transferTo('app_data/images/' + file.name);
    return {
      status:0,
      message:'上传成功'
    }
  }

  @GetMapping('/upload')
  multiple() {
    return new ModelAndView('multiple', { name: 'hello' });
  }

  @ApiOperation({ value: '上传文件', notes: '上传证书文件' })
  @ApiImplicitParams([
    RequestParam({ value: 'files', desc: '证书', required: true, dataType: MultipartFile }),
    RequestParam({ value: 'name', desc: '用户id' })
  ])
  @PostMapping('/upload2')
  async upload2(@RequestParam files: Array<MultipartFile>, name) {
    for (let file of files) {
      await file.transferTo('app_data/images/' + file.name)
    }
    return {
      status: 0,
      name: name,
      message: '上传成功'
    }
  }

  @ApiOperation({ value: 'xml测试', notes: 'application/json测试' })
  @ApiImplicitParams([
    { description: '提交数据', paramType: 'body', name: 'data', required: true },
  ])
  @PostMapping({ value: '/xml', consumes: 'application/xml', produces: 'application/xml' })
  xml(@RequestBody data) {
    console.log('xml', data);
    return data;
  }

  hello() {
    return 'hello3'
  }
}