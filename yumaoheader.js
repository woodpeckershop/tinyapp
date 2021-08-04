<header>
  <nav class="navbar navbar-expand-md navbar-dark bg-success">
    <a class="navbar-brand" href="/urls">TinyApp</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
      <div class="navbar-nav">
        <a class="nav-item nav-link" href="/urls">My URLs</a>
        <a class="nav-item nav-link" href="/urls/new">Create New URL</a>
        <% if (!username){ %>
          <p style="text-align:right">
        <form method = 'post' action = /login>
          <input name = 'username' value=''/>
          <button type = "submit">login</button>
        </form></p>
        <%} else {%>
        <p style="text-align:right">Logged In As:<%=username%>
        <form method = 'post' action = /logout>
        <button type = "submit">logout</button>
      </form></p>
        <%}%>
      </div>
    </div>
  </nav>
</header>