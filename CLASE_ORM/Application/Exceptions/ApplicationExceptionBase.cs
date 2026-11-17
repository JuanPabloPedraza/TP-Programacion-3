namespace CLASE_ORM.Application.Exceptions;

public abstract class ApplicationExceptionBase : Exception
{
    protected ApplicationExceptionBase(string message) : base(message) { }
}

public sealed class NotFoundException : ApplicationExceptionBase
{
    public NotFoundException(string message) : base(message) { }
}

public sealed class ConflictException : ApplicationExceptionBase
{
    public ConflictException(string message) : base(message) { }
}

public sealed class UnauthorizedException : ApplicationExceptionBase
{
    public UnauthorizedException(string message) : base(message) { }
}

public sealed class BusinessValidationException : ApplicationExceptionBase
{
    public BusinessValidationException(string message) : base(message) { }
}
