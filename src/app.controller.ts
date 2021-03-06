import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Body,
  HttpService,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Identity } from './interfaces/identity.interface';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { Data } from './interfaces/data.interface';
import { map } from 'rxjs/operators';
import { ApiOperation, ApiParam, ApiPropertyOptional, ApiResponse } from '@nestjs/swagger';

const ORG = 'org';
const OBJECT = 'object';
const OBJECT_ID = 'object_id';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private config: ConfigService,
  ) {}

  @ApiOperation({
    summary: 'Get connector identification',
    description: 'Retrieve information about the connector',
  })
  @Get()
  @ApiResponse({ status: 200, description: 'Return JSON array of information' })
  getIdentity(): Identity {
    return {
      name: this.config.get<string>('name'),
      displayName: this.config.get<string>('displayName'),
      version: this.config.get<string>('version'),
      company: this.config.get<string>('company'),
      icon: this.config.get<string>('url') + '/icon',
      url: this.config.get<string>('url'),
      hasConfig: true,
      hasInfo: true,
    };
  }

  @Get('env')
  getEnv(): string {
    return JSON.stringify(process.env);
  }

  @Get('icon')
  get(@Res() response: Response) {
    response.set('Content-Type', 'image/png');
    response.sendFile('icon.png', { root: './public' });
  }

  @Get('info')
  @ApiOperation({
    summary: 'Get information iframe url',
    description:
      'Retrieve a url that can be used to present information about the connector',
  })
  @ApiParam({
    name: 'org',
    type: 'string',
    description: 'The associated organization id',
    allowEmptyValue: true,
  })
  @ApiParam({
    name: 'object',
    type: 'string',
    description: 'The type of object to retrieve information for',
    allowEmptyValue: true,
  })
  @ApiParam({
    name: 'object_id',
    type: 'string',
    description: 'The object id to retrieve information for',
    allowEmptyValue: true,
  })
  @ApiResponse({ status: 200, description: 'Return JSON array containing a url' })
  getInfo(@Req() request: Request): Data {
    let orginalUrl = request.originalUrl;
    orginalUrl = orginalUrl.replace('/info', '/transactions');
    const url = request.protocol + '://' + request.get('host') + orginalUrl;
    return {
      url: url,
    };
  }

  @Get('config')
  @ApiOperation({
    summary: 'Get configuration iframe url',
    description:
      'Retrieve a url that can be used to present configuration options for the connector',
  })
  @ApiParam({
    name: 'org',
    type: 'string',
    description: 'The associated organization id',
    allowEmptyValue: true,
  })
  @ApiParam({
    name: 'object',
    type: 'string',
    description: 'The type of object to retrieve information for',
    allowEmptyValue: true,
  })
  @ApiParam({
    name: 'object_id',
    type: 'string',
    description: 'The object id to retrieve information for',
    allowEmptyValue: true,
  })
  @ApiResponse({ status: 200, description: 'Return JSON array containing a url' })
  getConfig() {
    return {};
    // return {
    //   url:
    //       'http://' +
    //       this.configService.get<string>('ipAddress') +
    //       ':' +
    //       this.configService.get<string>('port') +
    //       '/form',
    // };
  }

  @Get('transactions')
  getTransactions(@Req() request: Request, @Res() response: Response) {
    const object = request.query[OBJECT] as string;
    const object_id = request.query[OBJECT_ID] as string;
    response.set('Content-Type', 'text/html');
    response.send(this.appService.getTransactions(object, object_id));
  }

  @Get('form')
  getForm(@Res() response: Response) {
    response.set('Content-Type', 'text/html');
    response.send(this.appService.getForm());
  }

  @Get('metadata')
  getMetadata(@Req() request: Request, @Res() response: Response) {
    // console.log(request);
    const data = {
      originalUrl: request.hostname,
      baseUrl: request.baseUrl,
    };
    response.set('Content-Type', 'application/json');
    response.send(data);
    // this.metadata().subscribe((data) => {
    //   response.set('Content-Type', 'application/json');
    //   response.send(data);
    // });
  }

  // metadata() {
  //   const baseUrl = 'http://metadata.google.internal/computeMetadata/v1';
  //   const headersRequest = {
  //     'Metadata-Flavor': 'Google',
  //   };
  //
  //   return this.http
  //     .get(baseUrl + '/instance/hostname', {
  //       headers: headersRequest,
  //     })
  //     .pipe(map((response) => response.data));
  // }
}
