import { body } from 'express-validator';

import { validate } from '@/shared/constants/validator.constants';

/** Reusable field builders for express-validator chains. */

export const nameValidation = (field: string) =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${field} is required`)
    .isString()
    .withMessage(`${field} must be a string`)
    .isLength({
      min: validate.MIN_NAME,
      max: validate.MAX_NAME,
    })
    .withMessage(
      `${field} must be between ${validate.MIN_NAME} and ${validate.MAX_NAME} characters`,
    )
    .escape();

export const emailValidation = (field = 'email') =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail()
    .escape();

/** Strong password for signup / reset / change — not for login. */
export const passwordFieldValidation = (field: string) =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol',
    );

/**
 * Login credentials: only require a non-empty secret.
 * Strength rules on login reject valid stored passwords (e.g. bootstrap admins)
 * and leak policy to attackers — keep them on signup/reset only.
 */
export const loginPasswordValidation = (field = 'password') =>
  body(field)
    .notEmpty()
    .withMessage('Password is required')
    .isString()
    .withMessage('Password must be a string')
    .isLength({ min: 1, max: 128 })
    .withMessage('Password must be between 1 and 128 characters');

/** Default strong password field (`password`) for signup/reset. */
export const passwordValidation = () => passwordFieldValidation('password');
