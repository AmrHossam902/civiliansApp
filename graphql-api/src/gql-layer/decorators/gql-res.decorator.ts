import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GqlRes = createParamDecorator(
    (data: unknown, ctx: ExecutionContext)=>{
        return ctx.getArgByIndex(2).req.res;
    }
);