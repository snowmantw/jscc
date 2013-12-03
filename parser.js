
(function()
{
  var Parser = function()
  {
    this.lines = []
    this.states =
    {
      current: 'block',
      commentsBegin: false,
      commentsEnd: false
    }
    this.statistics =
    {
      loc: 0,
      commentedBlocks: 0,
      taggedLines: []
    }
  }

  Parser.prototype.split = function(content)
  {
    this.lines = content.split(/\n/)
    this.statistics.loc = this.lines.length
    return this
  }

  Parser.prototype.traverseCode = function()
  {
    this.lines.forEach((function(l, i, a)
    {
      var ln = i + 1;
      this.matchComment(l)
      this.statistics.taggedLines[ln] = this.states.current
    }).bind(this))
    return this
  }

  Parser.prototype.identifyBlocks = function()
  {
    this.statistics.taggedLines.forEach((function(tag, i, a)
    {
      if (undefined === tag) { return }
      if ('comments' === tag &&
          'block' === a[i+1])
      {
        this.statistics.commentedBlocks += 1
      }
    }).bind(this))
    return this
  }

  Parser.prototype.renderResult = function()
  {
    var omittedFirst = false
    var result = ""
    this.lines.forEach((function(l, i, a)
    {
      var ln = i + 1

      // Started with comment.
      if ('comments' === this.statistics.taggedLines[ln] &&
          'comments' === this.statistics.taggedLines[ln + 1] &&
          !omittedFirst)
      {
        result += "<ul class='block'>"
        omittedFirst = true
      }

      var cls = 'comments' === this.statistics.taggedLines[ln]
              ? 'comments'
              : 'block'
      result +=  "<li class='" + cls + "'><code>" + l + "</code></li>"

      // Not omitted first block yet.
      if ('block' === this.statistics.taggedLines[ln] &&
          'block' === this.statistics.taggedLines[ln + 1] &&
          !omittedFirst)
      {
        return
      }

      if ('block' === this.statistics.taggedLines[ln] &&
          'comments' === this.statistics.taggedLines[ln + 1])
      {
        result += "</ul><ul class='block'>"
        omittedFirst = true
      }
    }).bind(this))
    return {html: result, statistics: this.statistics}
  }

  Parser.prototype.matchComment = function(line)
  {
    // I believe it's rare to see cases like:
    //    "var foo = some code /*some comments*/",
    // so treat line as a basic unit is OK.

    // In the comments block.
    if ('comments' === this.states.current &&
        !line.match(/\*\//) &&
        false === this.states.commentsEnd &&
        true === this.states.commentsBegin)
    {
      this.states.current = 'comments'
    }
    else if (line.match(/\/\*/))
    {
      this.states.current = 'comments' 
      this.states.commentsBegin = true
    }
    else if (line.match(/\/\//)) { this.states.current = 'comments' }
    else if (line.match(/\*\//))
    {
      this.states.current = 'comments'
      this.states.commentsBegin = false 
      this.states.commentsEnd = true
    }
    else
    {
      if (this.states.commentsEnd)
      {
        this.states.commentsEnd = false
      }
      this.states.current = 'block'
    }
    return 'comments' === this.states.current
  }

  module.exports = Parser
})()
