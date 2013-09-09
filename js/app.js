/** @jsx React.DOM */

var Navbar = React.createClass({displayName: 'Navbar',
  render: function() {
    return (
      React.DOM.div( {className:"navbar"}, 
        React.DOM.div( {className:"navbar-inner"}, 
          React.DOM.a( {className:"brand", href:"#"}, "Bloggr"),
          React.DOM.ul( {className:"nav"}, 
            React.DOM.li(null, React.DOM.a( {href:"#/posts"}, "Posts")),
            React.DOM.li(null, React.DOM.a( {href:"#/about"}, "About"))
          )
        )
      )
    );
  }
});

var App = React.createClass({displayName: 'App',
  getInitialState: function() {
    return {page: 'home', activePostID: null, editing: false};
  },

  navigateToPost: function(editing, id) {
    this.setState({page: 'posts', activePostID: id, editing: editing});
  },

  componentDidMount: function() {
    var router = Router({
      '/': this.setState.bind(this, this.getInitialState(), null),
      '/posts': {
        '/:id/_edit': this.navigateToPost.bind(this, true),
        '/:id': this.navigateToPost.bind(this, false),
        '': this.setState.bind(this, {page: 'posts', activePostID: null, editing: false}, null)
      },
      '/about': this.setState.bind(this, {page: 'about', editing: false}, null)
    });
    router.init();
  },

  handleToggleEdit: function(newTitle, newExcerpt, newBody) {
    if (this.state.editing) {
      updatePost(this.state.activePostID, newTitle, newExcerpt, newBody);
    }

    window.location.hash = '/posts/' + this.state.activePostID + (
      this.state.editing ? '' : '/_edit'
    );
  },

  render: function() {
    var content;
    if (this.state.page === 'about') {
      content = About(null );
    } else if (this.state.page === 'posts') {
      content = (
        Posts(
          {posts:this.props.posts,
          activePost:getPostByID(this.props.posts, this.state.activePostID),
          editing:this.state.editing,
          onToggleEdit:this.handleToggleEdit}
        )
      );
    }
    return (
      React.DOM.div(null, 
        Navbar(null ),
        content
      )
    );
  }
});

var PostLink = React.createClass({displayName: 'PostLink',
  render: function() {
    return (
      React.DOM.tr(null, 
        React.DOM.td(null, 
          React.DOM.a( {href:'#/posts/' + this.props.post.id}, 
            this.props.post.title + ' ',
            React.DOM.small( {className:"muted"}, "by ", this.props.post.author.name)
          )
        )
      )
    );
  }
});

var showdown = new Showdown.converter();
var Markdown = React.createClass({displayName: 'Markdown',
  render: function() {
    return React.DOM.span( {dangerouslySetInnerHTML:{__html: showdown.makeHtml(this.props.children)}} );
  }
});

var PostControls = React.createClass({displayName: 'PostControls',
  handleChange: function() {
    this.props.onChange(
      this.refs.title.getDOMNode().value,
      this.refs.excerpt.getDOMNode().value,
      this.refs.body.getDOMNode().value
    );
  },

  render: function() {
    var post = this.props.post;
    if (this.props.editing) {
      return (
        React.DOM.div(null, 
          React.DOM.p(null, React.DOM.input( {ref:"title", type:"text", value:post.title, onChange:this.handleChange} )),
          React.DOM.p(null, React.DOM.input( {ref:"excerpt", type:"text", value:post.excerpt, onChange:this.handleChange} )),
          React.DOM.p(null, React.DOM.textarea( {ref:"body", value:post.body, onChange:this.handleChange} )),
          React.DOM.button( {onClick:this.props.onToggleEdit}, "Done")
        )
      );
    }
    return (
      React.DOM.div(null, 
        React.DOM.button( {onClick:this.props.onToggleEdit}, "Edit")
      )
    );
  }
});

var Post = React.createClass({displayName: 'Post',
  getInitialState: function() {
    return {
      editedTitle: null,
      editedExcerpt: null,
      editedBody: null
    };
  },

  handleChange: function(title, excerpt, body) {
    this.setState({editedTitle: title, editedExcerpt: excerpt, editedBody: body});
  },

  handleToggleEdit: function() {
    this.props.onToggleEdit(
      this.state.editedTitle,
      this.state.editedExcerpt,
      this.state.editedBody
    );
  },

  render: function() {
    var post = !this.props.editing ? this.props.post : {
      title: this.state.editedTitle || this.props.post.title,
      excerpt: this.state.editedExcerpt || this.props.post.excerpt,
      body: this.state.editedBody || this.props.post.body,
      author: this.props.post.author
    };
    var controls = (
      PostControls(
        {post:post,
        onChange:this.handleChange,
        onToggleEdit:this.handleToggleEdit,
        editing:this.props.editing}
      )
    );

    return (
      React.DOM.div(null, 
        controls,
        React.DOM.h1(null, post.title),
        React.DOM.h2(null, 
" by ", post.author.name + ' ',
          React.DOM.small( {className:"muted"}, "(",moment(post.date).fromNow(),")")
        ),
        React.DOM.hr(null ),
        React.DOM.div( {className:"intro"}, Markdown(null, post.excerpt)),
        React.DOM.div( {className:"below-the-fold"}, Markdown(null, post.body))
      )
    );
  }
});

var Posts = React.createClass({displayName: 'Posts',
  render: function() {
    var postLinks = this.props.posts.map(function(post) {
      return PostLink( {key:'postLink_' + post.id, post:post} );
    });

    var content = React.DOM.p( {className:"text-warning"}, "Please select a post");

    if (this.props.activePost) {
      content = this.transferPropsTo(Post( {post:this.props.activePost} ));
    }

    return (
      React.DOM.div( {className:"container-fluid"}, 
        React.DOM.div( {className:"row-fluid"}, 
          React.DOM.div( {className:"span3"}, 
            React.DOM.table( {className:"table"}, 
              React.DOM.thead(null, 
                React.DOM.tr(null, React.DOM.th(null, "Recent Posts"))
              ),
              React.DOM.tbody(null, postLinks)
            )
          ),
          React.DOM.div( {className:"span9"}, 
            content
          )
        )
      )
    );
  }
});

var About = React.createClass({displayName: 'About',
  render: function() {
    return (
      React.DOM.div(null, 
        React.DOM.div( {className:"about"}, 
          React.DOM.p(null, "Yehuda Katz is a member of the ", React.DOM.a( {href:"http://emberjs.com"}, "Ember.js"),", ", React.DOM.a( {href:"http://rubyonrails.org"}, "Ruby on Rails"),
" and ", React.DOM.a( {href:"http://www.jquery.com"}, "jQuery"), " Core Teams; he spends his daytime hours at the startup he founded, ",          React.DOM.a( {href:"http://www.tilde.io"}, "Tilde Inc."),"."),
          React.DOM.p(null, "Yehuda is co-author of best-selling ", React.DOM.a( {href:"http://affiliate.manning.com/idevaffiliate.php?id=485_176"}, "jQuery in Action"), " and ",          React.DOM.a( {href:"http://affiliate.manning.com/idevaffiliate.php?id=485_145"}, "Rails 3 in Action"),"."),
          React.DOM.p(null, "He spends most of his time hacking on open source—his main projects, along with others, like ", React.DOM.a( {href:"https://github.com/wycats/thor"}, "Thor"),", ",          React.DOM.a( {href:"http://www.handlebarsjs.com"}, "Handlebars"), " and ", React.DOM.a( {href:"https://github.com/carlhuda/janus"}, "Janus"), " or traveling the world doing evangelism work."),
          React.DOM.p(null, "He can be found on Twitter as ", React.DOM.a( {href:"http://www.twitter.com/wycats"}, "@wycats"),".")
        ),

        React.DOM.div( {className:"about"}, 
          React.DOM.p(null, "My name is Tom Dale. I helped create ", React.DOM.a( {href:"http://www.emberjs.com/"}, "Ember.js"),", a JavaScript framework that brings sanity to the web."),

          React.DOM.p(null, "In October of 2011, I co-founded ", React.DOM.a( {href:"http://www.tilde.io"}, "Tilde"), " with Yehuda Katz, Leah Silber and Carl Lerche."),

          React.DOM.p(null, "In my spare time I run a cash-for-beer exchange program at many local San Francisco dive bars.")
        )
      )
    );
  }
});

var posts = [{
  id: '1',
  title: "Rails is Omakase",
  author: { name: "d2h" },
  date: new Date('12-27-2012'),
  excerpt: "There are lots of à la carte software environments in this world. Places where in order to eat, you must first carefully look over the menu of options to order exactly what you want.",
  body: "I want this for my ORM, I want that for my template language, and let's finish it off with this routing library. Of course, you're going to have to know what you want, and you'll rarely have your horizon expanded if you always order the same thing, but there it is. It's a very popular way of consuming software.\n\nRails is not that. Rails is omakase."
}, {
  id: '2',
  title: "The Parley Letter",
  author: { name: "d2h" },
  date: new Date('12-24-2012'),
  excerpt: "My [appearance on the Ruby Rogues podcast](http://rubyrogues.com/056-rr-david-heinemeier-hansson/) recently came up for discussion again on the private Parley mailing list.",
  body: "A long list of topics were raised and I took a time to ramble at large about all of them at once. Apologies for not taking the time to be more succinct, but at least each topic has a header so you can skip stuff you don't care about.\n\n### Maintainability\n\nIt's simply not true to say that I don't care about maintainability. I still work on the oldest Rails app in the world."
}];

function getPostByID(posts, id) {
  return posts.filter(function(post) {
    return post.id === id;
  })[0];
}

function updatePost(id, title, excerpt, body) {
  var post = getPostByID(posts, id);

  post.title = title || post.title;
  post.excerpt = excerpt || post.excerpt;
  post.body = body || post.body;

  React.renderComponent(App( {posts:posts} ), document.body);
}

React.renderComponent(App( {posts:posts} ), document.body);
