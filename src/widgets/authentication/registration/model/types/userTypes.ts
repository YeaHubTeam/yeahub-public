import type * as yup from 'yup';

import { createRegisterSchema } from '../../lib/validation/registerSchema';

export type UserSchema = yup.InferType<ReturnType<typeof createRegisterSchema>>;
