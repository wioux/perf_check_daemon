window.perfCheckAppInit = function() {
  var container = document.getElementById("content");

  var app = React.createElement(BrowserApp, {
    searchPath: "/status/search.json",
    searchPlaceholder: "search jobs",
    initialFilter: window.perfcheckOpts.initialFilter,
    initialResults: window.perfcheckOpts.initialResults,
    initialSelectedResult: window.perfcheckOpts.initialSelectedResult,

    resultTag: function(props) {
      if (props.html)
        return React.createElement("div", {
          dangerouslySetInnerHTML: {__html: props.html}
        });

      var status = props.current ? "running"
                 : props.queued ? "queued"
                 : props.complete ? "complete"
                 : "failed";
      var e = React.createElement(
        "div", {},
        [
          React.createElement("small", { className: "pull-left status "+status }, status),
          React.createElement("small", { className: "time pull-right" }, [React.createElement("i", { className: "fa fa-clock-o" }), " " + moment(props.enqueued_at).calendar().toString()]),
          React.createElement("br"),
          React.createElement("br"),
          React.createElement("strong", {}, props.branch),
        ]
      );
      return e;
    }
  }, container.innerHTML);
  
  ReactDOM.render(app, container);
  window.perfCheckSatusAppInit();
};

window.perfCheckSatusAppInit = function() {
  var StatusBarComponent = React.createClass({
    displayName: 'StatusBarComponent',
    getInitialState: function getInitialState() {
      return { daemonOnline: false };
    },

    componentDidMount: function componentDidMount() {
      this.checkDaemonStatus();
      setInterval(this.checkDaemonStatus, 5000);
    },

    checkDaemonStatus: function checkDaemonStatus() {
      var self = this;
      var request = new XMLHttpRequest();
      request.open('GET', '/status/service-info.json', true);

      request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
          var resqueStatus = JSON.parse(request.responseText)["resque_online"];
          self.setState({ daemonOnline: resqueStatus });
        } else {
          console.error("(" + request.status + ") Invalid Request: ");
          console.error(request);
        }
      };

      request.onerror = function () {
        console.error("Connection error while trying to reach daemon status at /status/service-info.json");
      };
      request.send();
    },

    render: function render() {
      if (this.state.daemonOnline == true) {
        return React.createElement(
          'span',
          { className: 'system-status online' },
          'Daemon Online ',
          React.createElement('i', { className: 'fa fa-check' })
        );
      } else {
        return React.createElement(
          'span',
          { className: 'system-status offline' },
          'Daemon Offline ',
          React.createElement('i', { className: 'fa fa-times' })
        );
      }
    }
  });
  ReactDOM.render(React.createElement(StatusBarComponent, null), document.querySelector('#status-content'));

}