import { env } from 'cloudflare:workers';
import { handlePilot } from '../../../pilot-service.mjs';
export const dynamic = 'force-dynamic';
export const GET = (request: Request) => handlePilot(request, env);
export const POST = (request: Request) => handlePilot(request, env);
export const PUT = (request: Request) => handlePilot(request, env);
