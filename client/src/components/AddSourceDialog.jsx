import React from 'react';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import pretty from '../sources';
import addSource from '../addSource';
import Button from '@material-ui/core/Button';

export default ({source, open, handleClose}) => (
  <LoginDialog
    open={open}
    handleOk={(u, p) => {
      addSource(source, u, p);
      handleClose();
    }}
    handleClose={handleClose}
    title="Configure source"
    text={`Enter your login details for ${pretty[source]}`} />
);

export class LoginDialog extends React.Component {

  state = {
    username: '',
    password: ''
  };

  handleInput = key => event => {
    this.setState({ [key]: event.currentTarget.value })
  }

  render() {
    let {username, password} = this.state;
    let {open, title, text, handleClose, handleOk} = this.props;
    return (
      <Dialog
        open={open}
        onClose={handleClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {text}
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
          { handleClose == null ? null : 
            <Button onClick={handleClose} color="primary">Cancel</Button> }
          <Button onClick={() => handleOk(username, password)} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}