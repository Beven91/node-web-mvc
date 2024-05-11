import fs from 'fs';
import path from 'path';
import { RequestMapping, RequestBody, Autowired, ServletResponse, HttpServletResponse, RequestPart, RestController } from '../../../src/index';
import { Api, ApiOperation, ApiImplicitParams, RequestParam, MultipartFile } from '../../../src/index';
import { PostMapping } from '../../../src/index';
import ModelAndView from '../../../src/servlets/models/ModelAndView';
import GetMapping from '../../../src/servlets/annotations/mapping/GetMapping';

const example = `
<root type="object">
    <name type="string">张三</name>
    <addtime type="string">2014-01-01</addtime>
    <username type="string">abc</username>
    <id type="number">5</id>
    <rows type="array">
        <item type="object">
            <a type="number">100</a>
            <b type="number">200</b>
        </item>
    </rows>
</root>
`

@Api({ value: '文件上传' })
@RequestMapping('/multipart')
@RestController
export default class MultipartController {

  // @Autowired
  // public userInfo;

  @ApiOperation({ value: '上传文件', notes: '上传证书文件' })
  @PostMapping({ value: '/upload', produces: 'application/json' })
  async upload(@RequestPart file: MultipartFile, @RequestPart desc: string, id: number) {
    await file.transferTo('app_data/images/' + file.name);
    return {
      status: 0,
      desc: desc,
      id: id,
      message: '上传成功'
    }
  }

  @GetMapping('/upload')
  multiple() {
    return new ModelAndView('multiple', { name: 'hello' });
  }

  @ApiOperation({ value: '上传文件', notes: '上传证书文件' })
  @ApiImplicitParams([
    { name: 'files', description: '证书', required: true, dataType: 'MultipartFile[]' },
    { name: 'name', description: '用户id' }
  ])
  @PostMapping('/upload2')
  async upload2(@RequestPart files: Array<MultipartFile>,@RequestPart name: string) {
    console.log(files[0].size)
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
    { description: '提交数据', name: 'data', required: true },
  ])
  @PostMapping({ value: '/xml', consumes: 'application/xml', produces: 'application/xml' })
  xml(@RequestBody data: any) {
    console.log('xml', data);
    return data;
  }

  @ApiOperation({ value: '获取登陆二维码' })
  @GetMapping('/qrcode')
  async qrcode(@ServletResponse response: HttpServletResponse) {
    const buffer = fs.readFileSync(path.join(__dirname, 'aseets', 'qrcode.png'));
    response.setHeader('Content-Type', 'image/png');
    response.setHeader('Content-Length', buffer.length)
    // setTimeout(()=>{
    response.setStatus(200).end(buffer);
    // return response.setStatus(200).end(buffer);
  }
} 