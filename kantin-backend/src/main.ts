import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { UygulamaModulu } from './uygulama.modulu';

async function baslat() {
  const uygulama = await NestFactory.create(UygulamaModulu);

  // CORS aktif et
  const onYuzUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  uygulama.enableCors({
    origin: [onYuzUrl, 'http://localhost:5173', 'http://localhost:3000', 'https://kantin-projesi-cqiprmrn1-hilmis-projects-4c9cd220.vercel.app'],
    credentials: true,
  });

  // Global validation pipe
  uygulama.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  const port = process.env.PORT || 3000;
  await uygulama.listen(port);
  console.log(`🚀 Sunucu ${port} portunda çalışıyor`);
}
baslat();