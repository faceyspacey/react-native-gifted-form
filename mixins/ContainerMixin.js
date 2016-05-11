var React = require('react-native');

var {
  ScrollView,
  View,
  Platform,
  Dimensions
} = React;

var GiftedFormManager = require('../GiftedFormManager');

module.exports = {

  propTypes: {
    formName: React.PropTypes.string,
    scrollOnTap: React.PropTypes.bool,
    scrollEnabled: React.PropTypes.bool,
    formStyles: React.PropTypes.object,
    // navigator: ,
  },

  getDefaultProps() {
    return {
      formName: 'form',
      scrollOnTap: true, // auto scroll when focus textinput in bottom of screen
      scrollEnabled: true,
      formStyles: {},
      navigator: null, // @todo test when null if crash
    }
  },

  handleFocus(view) {
    if(this.props.scrollEnabled !== true || typeof view !== 'object' || !view.measure) return;

    var keyboardHeight = 259;
    var keyboardTop = Dimensions.get('window').height - keyboardHeight;
    
    view.measure((x, y, width, height, pageX, pageY) => {
      var inputBottom = pageY + height;

      if(inputBottom > keyboardTop) {
        this.scrollTo(y);
      }
    });
  },
  scrollTo(y) {
    this._scrollResponder.scrollTo({x: 0, y, animated: false});
  },

  componentDidMount() {
    if (this.props.scrollEnabled === true) {
      this._scrollResponder = this.refs.container.getScrollResponder();

      console.log('HELP', this.refs.container, this.refs.container.measure)

      //this.refs.container.measure((x, y, width, height) => {
      //  this.containerHeight = height;
      //  console.log('CONTAINER HEIGHT', x, y, width, height)
      //});
    }
  },

  handleBlur() {
    //not needed anymore for features related to scrolling to inputs
  },

  handleValidation() {
    if (!this.props.onValidation) return;
    var validation = GiftedFormManager.validate(this.props.formName);
    this.props.onValidation(validation);
  },

  handleValueChange() {
    if (!this.props.onValueChange) return;
    var values = GiftedFormManager.getValues(this.props.formName);
    this.props.onValueChange(values);
  },

  childrenWithProps() {
    return React.Children.map(this.props.children, (child) => {
      if (!!child) {
        return React.cloneElement(child, {
          formStyles: this.props.formStyles,
          openModal: this.props.openModal,
          formName: this.props.formName,
          form: this,
          navigator: this.props.navigator,
          onFocus: this.handleFocus,
          onBlur: this.handleBlur,
          onValidation: this.handleValidation,
          onValueChange: this.handleValueChange,
        });
      }
    });
  },

  _renderContainerView() {
    var formStyles = this.props.formStyles;
    var viewStyle = [(this.props.isModal === false ? [styles.containerView, formStyles.containerView] : [styles.modalView, formStyles.modalView]), this.props.style];
    if (this.props.scrollEnabled === true) {
      return (
        <ScrollView
          ref='container'
          style={viewStyle}
          automaticallyAdjustContentInsets={false}
          keyboardDismissMode='on-drag'
          keyboardShouldPersistTaps={true}

          onTouchStart={this.props.scrollOnTap === true ? this._onTouchStart : null}
          onScroll={this.props.scrollOnTap === true ? this._onScroll : null}
          scrollEventThrottle={this.props.scrollOnTap === true ? 200 : 0}

          {...this.props}
        >
          {this.childrenWithProps()}
        </ScrollView>
      );
    }
    return (
      <View
        ref='container'
        style={viewStyle}
        keyboardDismissMode='on-drag' // its working on View ?

        {...this.props}
      >
        {this.childrenWithProps()}
      </View>
    );
  },
};

var styles = {
  containerView: {
    backgroundColor: '#eee',
    flex: 1,
  },
  modalView: {
    backgroundColor: '#eee',
    flex: 1,
  },
};
