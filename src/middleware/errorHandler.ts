import { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  // eslint-disable-next-line no-console
  console.debug(err);

  const errMessage =
    err && typeof err === 'object' && 'message' in err
      ? (err as any).message
      : 'Something went wrong';

  res.status(500).send({
    error: errMessage,
  });

  next(err);
};
