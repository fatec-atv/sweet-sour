import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingRight: 25,
    paddingLeft: 25,
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 25,
  },
  textArea: {
    height: 100,
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    marginBottom: 15,
  },
  picker: {
    height: 50,
  },
  selectedItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDD2DD',
    borderRadius: 15,
    padding: 5,
    margin: 5,
    borderColor: '#FC7493',
    borderWidth: 1,
  },
  selectedItem: {
    marginRight: 10,
    marginLeft: 5,
    fontWeight: 'bold',
    color: '#FC7493',
  },
  removeItem: {
    color: '#FC7493',
    fontWeight: 'bold',
    marginRight: 5,
  },
  button: {
    backgroundColor: '#FC7493',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePicker: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePickerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 16,
  }
});

export default styles;
