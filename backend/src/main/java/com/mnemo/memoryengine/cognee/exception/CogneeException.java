package com.mnemo.memoryengine.cognee.exception;

public class CogneeException extends RuntimeException {

    public CogneeException(String message) {
        super(message);
    }

    public CogneeException(String message, Throwable cause) {
        super(message, cause);
    }
}
