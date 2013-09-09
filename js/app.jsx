/** @jsx React.DOM */

var Navbar = React.createClass({
  render: function() {
    return (
      <div class="navbar">
        <div class="navbar-inner">
          <a class="brand" href="#">Bloggr</a>
          <ul class="nav">
            <li><a href="#/posts">Posts</a></li>
            <li><a href="#/about">About</a></li>
          </ul>
        </div>
      </div>
    );
  }
});

var App = React.createClass({
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
      content = <About />;
    } else if (this.state.page === 'posts') {
      content = (
        <Posts
          posts={this.props.posts}
          activePost={getPostByID(this.props.posts, this.state.activePostID)}
          editing={this.state.editing}
          onToggleEdit={this.handleToggleEdit}
        />
      );
    }
    return (
      <div>
        <Navbar />
        {content}
      </div>
    );
  }
});

var PostLink = React.createClass({
  render: function() {
    return (
      <tr>
        <td>
          <a href={'#/posts/' + this.props.post.id}>
            {this.props.post.title + ' '}
            <small class="muted">by {this.props.post.author.name}</small>
          </a>
        </td>
      </tr>
    );
  }
});

var showdown = new Showdown.converter();
var Markdown = React.createClass({
  render: function() {
    return <span dangerouslySetInnerHTML={{__html: showdown.makeHtml(this.props.children)}} />;
  }
});

var PostControls = React.createClass({
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
        <div>
          <p><input ref="title" type="text" value={post.title} onChange={this.handleChange} /></p>
          <p><input ref="excerpt" type="text" value={post.excerpt} onChange={this.handleChange} /></p>
          <p><textarea ref="body" value={post.body} onChange={this.handleChange} /></p>
          <button onClick={this.props.onToggleEdit}>Done</button>
        </div>
      );
    }
    return (
      <div>
        <button onClick={this.props.onToggleEdit}>Edit</button>
      </div>
    );
  }
});

var Post = React.createClass({
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
      <PostControls
        post={post}
        onChange={this.handleChange}
        onToggleEdit={this.handleToggleEdit}
        editing={this.props.editing}
      />
    );

    return (
      <div>
        {controls}
        <h1>{post.title}</h1>
        <h2>
          by {post.author.name + ' '}
          <small class="muted">({moment(post.date).fromNow()})</small>
        </h2>
        <hr />
        <div class="intro"><Markdown>{post.excerpt}</Markdown></div>
        <div class="below-the-fold"><Markdown>{post.body}</Markdown></div>
      </div>
    );
  }
});

var Posts = React.createClass({
  render: function() {
    var postLinks = this.props.posts.map(function(post) {
      return <PostLink key={'postLink_' + post.id} post={post} />;
    });

    var content = <p class="text-warning">Please select a post</p>;

    if (this.props.activePost) {
      content = this.transferPropsTo(<Post post={this.props.activePost} />);
    }

    return (
      <div class="container-fluid">
        <div class="row-fluid">
          <div class="span3">
            <table class='table'>
              <thead>
                <tr><th>Recent Posts</th></tr>
              </thead>
              <tbody>{postLinks}</tbody>
            </table>
          </div>
          <div class="span9">
            {content}
          </div>
        </div>
      </div>
    );
  }
});

var About = React.createClass({
  render: function() {
    return (
      <div>
        <div class="about">
          <p>Yehuda Katz is a member of the <a href="http://emberjs.com">Ember.js</a>, <a href="http://rubyonrails.org">Ruby on Rails</a>
          and <a href="http://www.jquery.com">jQuery</a> Core Teams; he spends his daytime hours at the startup he founded,
          <a href="http://www.tilde.io">Tilde Inc.</a>.</p>
          <p>Yehuda is co-author of best-selling <a href="http://affiliate.manning.com/idevaffiliate.php?id=485_176">jQuery in Action</a> and
          <a href="http://affiliate.manning.com/idevaffiliate.php?id=485_145">Rails 3 in Action</a>.</p>
          <p>He spends most of his time hacking on open source—his main projects, along with others, like <a href="https://github.com/wycats/thor">Thor</a>,
          <a href="http://www.handlebarsjs.com">Handlebars</a> and <a href="https://github.com/carlhuda/janus">Janus</a> or traveling the world doing evangelism work.</p>
          <p>He can be found on Twitter as <a href="http://www.twitter.com/wycats">@wycats</a>.</p>
        </div>

        <div class="about">
          <p>My name is Tom Dale. I helped create <a href="http://www.emberjs.com/">Ember.js</a>, a JavaScript framework that brings sanity to the web.</p>

          <p>In October of 2011, I co-founded <a href="http://www.tilde.io">Tilde</a> with Yehuda Katz, Leah Silber and Carl Lerche.</p>

          <p>In my spare time I run a cash-for-beer exchange program at many local San Francisco dive bars.</p>
        </div>
      </div>
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

  React.renderComponent(<App posts={posts} />, document.body);
}

React.renderComponent(<App posts={posts} />, document.body);