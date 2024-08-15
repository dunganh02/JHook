import { Restaurant } from '@/modules/restaurants/schemas/restaurant.schema';
import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name }) // create a reference to the user schema
  user: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Restaurant.name }) // create a reference to the restaurant schema
  restaurant: mongoose.Schema.Types.ObjectId;

  @Prop()
  rating: number;

  @Prop()
  image: string;

  @Prop()
  comment: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
