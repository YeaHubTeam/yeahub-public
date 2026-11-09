import type * as yup from 'yup';

import { createLoginSchema } from '../../lib/validation/loginSchema';

export type LoginSchema = yup.InferType<ReturnType<typeof createLoginSchema>>;
