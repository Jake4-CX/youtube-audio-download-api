import * as dotenv from 'dotenv';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import * as util from 'node:util';
import { createLogger, format, transports } from 'winston';

dotenv.config();
const { combine, timestamp, printf, colorize } = format;

const dirLogs = join(process.cwd(), 'logs');
if (!existsSync(dirLogs)) {
  mkdirSync(dirLogs);
}

const customFormat = printf(({ level, message, timestamp, ...rest }) => {
  const splat = rest[Symbol.for('splat')] || [];
  const strArgs = Array.isArray(splat)
    ? splat
      .map((s) => util.formatWithOptions({ colors: false, depth: 10 }, s))
      .join(' ')
    : '';
  return `${timestamp} [${level}]: ${util.formatWithOptions(
    { colors: false, depth: 10 },
    message
  )} ${strArgs}`;
});

const date = new Date().toISOString().split('T')[0];

const logger = createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    customFormat
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new transports.File({
      filename: join(dirLogs, `${date}-error.log`),
      level: 'error'
    }),
    new transports.File({
      filename: join(dirLogs, `${date}-combined.log`)
    })
  ]
});

// Modified console transport with level-only coloring
logger.add(
  new transports.Console({
    format: combine(
      format((info) => {
        // Colorize only the level
        info.level = colorize().colorize(info.level, info.level);
        return info;
      })(),
      timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      customFormat
    )
  })
);

export default logger;