package com.mnemo.memoryengine.cognee.exception;

public class CogneeApiException extends CogneeException {

    private final int statusCode;

    public CogneeApiException(int statusCode, String message) {
        super("Cognee API returned " + statusCode + ": " + message);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
