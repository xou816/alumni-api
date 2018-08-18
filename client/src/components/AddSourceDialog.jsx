import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import pretty from '../sources';
import addSource from '../addSource';

export default class AddSourceDialog extends React.Component {

  state = {
    open: false,
    username: '',
    password: ''
  };

  handleClickOpen = () => this.setState({ open: true });

  handleClose = () => this.setState({ open: false });

  handleInput = key => event => {
    this.setState({ [key]: event.currentTarget.value })
  }

  handleSave = () => {
    this.setState({ open: false });
    addSource(this.props.source, this.state.username, this.state.password);
  }

  render() {
    let {username, password} = this.state;
    let {ButtonProps, source} = this.props;
    return (
      <React.Fragment>
        <Button {...ButtonProps} onClick={this.handleClickOpen} color="secondary">Configure</Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}>
          <DialogTitle>Configure source</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter your login details for {pretty[source]}.
            </DialogContentText>
            <TextField
              margin="dense"
              label="Username"
              value={username}
              onChange={this.handleInput('username')}
              fullWidth />
            <TextField
              margin="dense"
              label="Password"
              value={password}
              onChange={this.handleInput('password')}
              type="password"
              fullWidth />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleSave} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}