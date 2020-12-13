var app = {
  getError(title, detail, status, source){
    status = status || 500;
    source = source || {};

    return {
      "errors": [
        {
          "status": status,
          "source": source,
          "title":  title,
          "detail": detail
        }
      ]
    };
  }

};



module.exports = app;
