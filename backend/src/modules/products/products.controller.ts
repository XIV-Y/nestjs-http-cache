import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ETagInterceptor } from '@/common/interceptors/etag.interceptor';

@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Get()
  @UseInterceptors(ETagInterceptor)
  findAll() {
    return this.productsService.findAll();
  }
}
