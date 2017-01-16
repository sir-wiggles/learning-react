var React         = require('react');
var ReactDOM      = require('react-dom');
var Flux          = require('flux');
var EventEmitter  = require('events').EventEmitter;

import './index.css';

// ============================================================ Constants
var Constants = {
    ADD_ITEM: "ADD_ITEM",
    REMOVE_ITEM: "REMOVE_ITEM",

    CHANGE_EVENT: "CHANGE",
};

// ============================================================ Dispatcher
// One and only dispatcher for the whole app
// Dependants:
//      Action
//      Store
var Dispatcher = new Flux.Dispatcher();
Dispatcher.handleAction = function(action) {
    console.log("Dispatcher.handleAction", action);
    this.dispatch({
        source: "VIEW_ACTION",
        action: action,
    });
};

// ============================================================ Actions
// Action is called from a component and drives change.  
// They send information to the dispatcher with the action that
// has happened (Constants) and the data that.
var Actions = {
    addItem: function(item) {
        console.log("Actions.addItem", item);
        Dispatcher.handleAction({
            actionType: Constants.ADD_ITEM,
            data: item
        });
    },
    removeItem: function(index) {
        console.log("Actions.removeItem", index);
        Dispatcher.handleAction({
            actionType: Constants.REMOVE_ITEM,
            data: index,
        });
    },
};

// ============================================================ Store
// Store handles all data mutations. This should be the single 
// source of truth regarding data for the app.

var _store = {
    list: [],
};

// Components register callbacks that listen for changes
var Store = Object.assign({}, EventEmitter.prototype, {
    addChangeListener: function(cb) {
        console.log("Store.addChangeListener", cb);
        this.on(Constants.CHANGE_EVENT, cb);
    },
    removeChangeListener: function(cb) {
        console.log("Store.removeChangeListener", cb);
        this.removeListener(Constants.CHANGE_EVENT, cb);
    },
    getList: function() {
        console.log("Store.getList");
        return _store.list;
    },
});

var _addItem = function(item) {
    console.log("_store.addItem", item)
    _store.list.push(item);
};

var _removeItem = function(index) {
    console.log("_store.removeItem", index);
    _store.list.splice(index, 1);
};

Dispatcher.register(function(payload) {
    console.log("Dispatche.register", payload);
    var action = payload.action;
    switch(action.actionType) {
        case Constants.ADD_ITEM:
            _addItem(action.data);
            break;
        case Constants.REMOVE_ITEM:
            _removeItem(action.data);
            break;
        default:
            return true;
    }
    Store.emit(Constants.CHANGE_EVENT);
})

// =========================================================== Components

class App extends React.Component {
    constructor(props) {
        console.log("App.constructor", props);
        super(props);
        this.state = {};
    };

    render() {
        console.log("Add.render");
        return (
            <div className="container">
                <div className="row">
                    <ListContainer />
                </div>
            </div>
        );
    };
};

class ListContainer extends React.Component {
    constructor(props) {
        console.log("ListContainer.constructor", props);
        super(props);
        this.state = {
            list: Store.getList(),
        };

        this._onChange = this._onChange.bind(this);
    };

    componentDidMount() {
        console.log("ListContainer.componentDidMount")
        Store.addChangeListener(this._onChange);
    };

    componentWillUnmount() {
        console.log("ListContainer.componentWillUnmount")
        Store.removeChangeListener(this._onChange);
    };

    _onChange() {
        console.log("ListContainer._onChange");
        this.setState({
            list: Store.getList()
        });
    };

    render() {
        console.log("ListContainer.render");
        return (
            <div className="col-sm-6 col-md-offset-3">
                <div className="col-sm-12">
                    <h3 className="text-center">Todo List</h3>
                    <AddItem />
                    <List items={this.state.list} />
                </div>
            </div>
        );
    };
};

class AddItem extends React.Component {
    constructor(props) {
        console.log("AddItem.constructor", props);
        super(props);
        this.state = {};

        this.handleSubmit = this.handleSubmit.bind(this);
    };

    handleSubmit(e) {
        if(e.keyCode === 13) {
            console.log("AddItem.handleSubmit", e);
            var newItem = this.refs.newItem.value;
            this.refs.newItem.value = '';
            Actions.addItem(newItem);
        };
    };

    render() {
        console.log("AddItem.render");
        return (
            <div>
                <input 
                    type="text" 
                    ref="newItem" 
                    className="form-control" 
                    placeholder="New Item"
                    onKeyDown={this.handleSubmit} 
                />
            </div>
        );
    };
};

class List extends React.Component {
    constructor(props) {
        console.log("List.constructor", props);
        super(props);
        this.state = {};
    };

    render() {
        console.log("List.render")
        var listItems = this.props.items.map(function(item, index) {
            return (
                <li key={index} className="list-group-item">
                    <span
                        className="glyphicon glyphicon-remove"
                        onClick={Actions.removeItem}>Remove
                    </span>
                    <span>
                        {item}
                    </span>
                </li>
            );
        });
        return (
            <ul>
                {listItems}
            </ul>
        );
    };
};


ReactDOM.render(
    <App />,
    document.getElementById('root')
);
