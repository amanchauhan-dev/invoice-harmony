import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: Error | ZodError, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    
    if (err instanceof ZodError) {
        const issues = (err as ZodError).issues;
        res.status(400).json({
            status: 'error',
            message: issues[0]?.message || 'Validation failed',
            errors: issues
        });
        return;
    }

    res.status(500).json({
        status: 'error',
        message: err.message || 'Internal server error'
    });
};
