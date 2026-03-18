package cn.example.dataserver.common;

public class TokenErrorException extends RuntimeException {
    public TokenErrorException(String message) {
        super(message);
    }
}
