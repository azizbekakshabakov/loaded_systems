const applyMiddleware = (middleware, resolver) => {
    return middleware(resolver);
};

export default applyMiddleware;