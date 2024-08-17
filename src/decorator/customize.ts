import { SetMetadata } from '@nestjs/common';

// customer anotaion
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);