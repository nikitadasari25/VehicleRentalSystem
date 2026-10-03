package com.example.content_service.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Pointcut("execution(* com.example.content_service.controller..*(..)) || " +
            "execution(* com.example.content_service.service..*(..))")
    public void applicationPointcut() {
    }

    @Before("applicationPointcut()")
    public void logMethodEntry(JoinPoint joinPoint) {

        log.info("Entering Method: {} with arguments: {}",
                joinPoint.getSignature().getName(),
                Arrays.toString(joinPoint.getArgs()));
    }

    @AfterReturning(
            pointcut = "applicationPointcut()",
            returning = "result")
    public void logMethodExit(
            JoinPoint joinPoint,
            Object result) {

        log.info("Exiting Method: {} with response: {}",
                joinPoint.getSignature().getName(),
                result);
    }

    @AfterThrowing(
            pointcut = "applicationPointcut()",
            throwing = "exception")
    public void logException(
            JoinPoint joinPoint,
            Exception exception) {

        log.error("Exception in Method: {} with message: {}",
                joinPoint.getSignature().getName(),
                exception.getMessage(),
                exception);
    }

    @Around("applicationPointcut()")
    public Object logExecutionTime(
            ProceedingJoinPoint joinPoint) throws Throwable {

        long startTime = System.currentTimeMillis();

        Object result = joinPoint.proceed();

        long endTime = System.currentTimeMillis();

        log.info("Method {} executed in {} ms",
                joinPoint.getSignature().getName(),
                (endTime - startTime));

        return result;
    }
}