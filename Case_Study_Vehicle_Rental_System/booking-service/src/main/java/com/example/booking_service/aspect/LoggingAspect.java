package com.example.booking_service.aspect;

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

    @Pointcut("execution(* com.example.booking_service.controller..*(..)) || " +
            "execution(* com.example.booking_service.service..*(..))")
    public void applicationPointcut() {
    }

    @Before("applicationPointcut()")
    public void logMethodEntry(JoinPoint joinPoint) {

        log.info("Entering Method: {} | Arguments: {}",
                joinPoint.getSignature().getName(),
                Arrays.toString(joinPoint.getArgs()));
    }

    @AfterReturning(
            pointcut = "applicationPointcut()",
            returning = "result")
    public void logMethodExit(
            JoinPoint joinPoint,
            Object result) {

        log.info("Exiting Method: {} | Response: {}",
                joinPoint.getSignature().getName(),
                result);
    }

    @AfterThrowing(
            pointcut = "applicationPointcut()",
            throwing = "exception")
    public void logException(
            JoinPoint joinPoint,
            Exception exception) {

        log.error("Exception in Method: {} | Message: {}",
                joinPoint.getSignature().getName(),
                exception.getMessage(),
                exception);
    }

    @Around("applicationPointcut()")
    public Object logExecutionTime(
            ProceedingJoinPoint joinPoint) throws Throwable {

        long startTime = System.currentTimeMillis();

        Object result = joinPoint.proceed();

        long executionTime = System.currentTimeMillis() - startTime;

        log.info("Method: {} executed in {} ms",
                joinPoint.getSignature().getName(),
                executionTime);

        return result;
    }
}