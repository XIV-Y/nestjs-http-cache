import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ETagInterceptor } from '@/common/interceptors/etag.interceptor';
import { LastModifiedInterceptor } from '@/common/interceptors/last-modified.interceptor';

@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Get()
  // @UseInterceptors(ETagInterceptor)
  @UseInterceptors(LastModifiedInterceptor)
  findAll() {
    return this.productsService.findAll();
  }
}
