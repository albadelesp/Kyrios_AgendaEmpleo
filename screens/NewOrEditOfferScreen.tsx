import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, ScrollView, Text, View, Alert, Platform,  } from 'react-native';
import { Input, Button, Switch } from 'react-native-elements';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, updateDoc, doc } from "firebase/firestore"; 
import { db } from "../config/firebase";
import { StackScreenProps } from '@react-navigation/stack';
import { Offer } from '../models/Offer';
import * as Notifications from 'expo-notifications';
//import { GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import axios from 'axios';
import Autocomplete from '../models/Autocomplete';


const auth = getAuth();

const today = new Date();
const day = today.getDate().toLocaleString().padStart(2, '0');
const month = (today.getMonth() + 1).toLocaleString().padStart(2, '0');
const year = today.getFullYear();
const formatoCompleto = `${day}-${month}-${year}`;

const NewOrDetailOfferScreen: React.FC<StackScreenProps<any>> = ({ navigation, route }) => {
  
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  async function sendPushNotification(expoPushToken: string) {
    if (!expoPushToken) {
      console.error("Falta expoPushToken");
      return;
    }
    const fechaActual = value.interview_date.split('-');
    const day = parseInt(fechaActual[0], 10);
    const month = parseInt(fechaActual[1], 10) - 1; // Restamos 1 porque los meses en JavaScript van de 0 a 11
    const year = parseInt(fechaActual[2], 10);
    const interviewTime = value.interview_hour.split(':');
    const hora = parseInt(interviewTime[0], 10);
    const minutos = parseInt(interviewTime[1], 10);
    const fechaActualObj = new Date(year, month, day, hora, minutos);
    const dayBefore = new Date(fechaActualObj);
    dayBefore.setDate(fechaActualObj.getDate() - 1);
  
    const notificationTime = Math.floor((dayBefore.getTime() - Date.now()) / 1000);
    if(notificationTime <= 0){
      const twoHoursBefore = new Date(fechaActualObj);
      twoHoursBefore.setHours(fechaActualObj.getHours() - 2);
      const timeToTwoHoursBefore = Math.floor((twoHoursBefore.getTime() - Date.now()) / 1000);
      Notifications.scheduleNotificationAsync({
        identifier:String(expoPushToken),
        content:{
          title:`Recuerda que en menos de 2 horas es tu entrevista para ${value.position} en ${value.company}`,
          body:`En la dirección ${value.interview_address}. ¡Buena suerte!`,
          sound:true,
          
        }
        ,
        trigger:{
          seconds: timeToTwoHoursBefore > 0 ? timeToTwoHoursBefore : 1,
        },
      })
      .then(() => console.log("Notificación programada"))
      .catch((error) => console.error(error));
  }
  else{
    Notifications.scheduleNotificationAsync({
      identifier:String(expoPushToken),
      content:{
        title:`Recuerda mañana es tu entrevista para ${value.position} en ${value.company}`,
        body:`En la dirección ${value.interview_address}. ¡A por ello!`,
        sound:true,
        data:{
          data:{ data: "goes here" }
        }
      }
      ,
      trigger:{
        seconds:notificationTime,
      },
    })
    .then(() => console.log("Notificación programada"))
    .catch((error) => console.error(error));
  }
  }
  async function registerForPushNotificationsAsync() {
    let token;
  
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFA40B',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC
      });
    }
  
    if (Platform.OS !== 'web') {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Fallo al conseguir el token');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log( token);
    } else {
      alert('Debe ser un dispositivo fisico para obtener el token');
    }
  
    return token;
  }



 
let error: string = '';

const [value, setValue] = React.useState({
    position: '',
    company: '',
    schedule: '',
    address: '',
    latitude: 40.4168,
    longitude: -3.7038,
    registration_date: formatoCompleto ,

    mandatory_education: false,
    required_education: '',
    mandatory_experience: false,
    required_experience: '',

    interview_date: '',
    interview_hour: '',
    contact_person: '',
    interview_address: '',
    interview_latitude: 40.4168,
    interview_longitude: -3.7038,
    interview_state: '',
    interview_color: ''
});
  

const offer : Offer = route?.params?.offer;
const isEditMode = offer != undefined;
const screenTitle = isEditMode ? 'Editar oferta' : 'Nueva oferta';

const [selectedAddress, setSelectedAddress] = useState(null);
const [selectedInterviewAddress, setSelectedInterviewAddress] = useState(null);
  
//const jobRefAddress = useRef<GooglePlacesAutocompleteRef>(null);
//const interviewRefAddress = useRef<GooglePlacesAutocompleteRef>(null);

const [expoPushToken, setExpoPushToken] = React.useState('');
const [notification, setNotification] = useState<Notifications.Notification | boolean>(false);
const notificationListener = useRef();
const responseListener = useRef();
const [notificationPermission, setNotificationPermission] = useState('');

useEffect(() => {
  const getNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationPermission(status);
  };

  getNotificationPermission();
}, []);

useEffect(() => {
  const registerForNotifications = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
      } else {
        console.error('El token de Expo Push es undefined');
      }
    } catch (error) {
      console.error('Error al registrar notificaciones:', error);
    }
  };

  registerForNotifications();

  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    setNotification(notification);
  });

  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log(response);
  });

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}, []);



  

useEffect(() => {
  navigation.setOptions({ headerTitle: screenTitle });
  if (isEditMode && offer) {
    setValue({
      position: offer.position || '',
      company: offer.company || '',
      schedule: offer.schedule || '',
      address: offer.job_address || '',
      latitude: offer.job_latitude,
      longitude: offer.job_longitude,
      registration_date: offer.registration_date || '',

      mandatory_education: offer.mandatory_education,
      required_education: offer.required_education,
      mandatory_experience: offer.mandatory_experience,
      required_experience: offer.required_experience,

      interview_date: offer.interview_date || '',
      interview_hour: offer.interview_hour || '',
      contact_person: offer.contact_person || '',
      interview_address: offer.interview_address || '',
      interview_latitude: offer.interview_latitude,
      interview_longitude: offer.interview_longitude,
      interview_state: offer.interview_state || '',
      interview_color: offer.interview_color || ''
    });
    setSelectedAddress({
      street: offer.job_address,
      latitude: offer.job_latitude,
      longitude: offer.job_longitude,
    });
    setSelectedInterviewAddress({
      street: offer.interview_address,
      latitude: offer.interview_latitude,
      longitude: offer.interview_longitude,
    });
  }
}, [isEditMode, offer]);




  function buildOfferObjectFromState() {
    let offer_obj : Offer = {
      position: value.position,
      company: value.company,
      schedule: value.schedule,
      job_address: value.address,
      job_latitude: value.latitude,
      job_longitude: value.longitude,
      registration_date: value.registration_date,

      mandatory_education: value.mandatory_education,
      required_education: value.required_education,
      mandatory_experience: value.mandatory_experience,
      required_experience: value.required_experience,

      interview_date: value.interview_date,
      interview_hour: value.interview_hour,
      contact_person: value.contact_person,
      interview_address: value.interview_address,
      interview_latitude: value.interview_latitude,
      interview_longitude: value.interview_longitude,
      interview_state: value.interview_state,
      interview_color: value.interview_color
    }
    
    let obj = JSON.parse(JSON.stringify(offer_obj));
    // eliminamos propiedades undefined, ya que firebase no las soporta
    Object.keys(obj).forEach(key => obj[key] === undefined ? delete obj[key] : {});
    
    return obj;
  }

  

  async function saveNewOffer() {
    const user_uuid = auth.currentUser?.uid;
    const collection_name = `users/${user_uuid}/offers`;
    try {
      await addDoc(collection(db, collection_name), buildOfferObjectFromState());
      //Notificación
      await sendPushNotification(expoPushToken);

      navigation.navigate('Offers');
    } catch (e) {
      console.log(e);
      Alert.alert("Error guardando nueva oferta");
    }
  }


  async function updateOffer() {
    const user_uuid = auth.currentUser?.uid;
    const offer_path = `users/${user_uuid}/offers/${offer.documentId}`;
    const offerDocRef = doc(db, offer_path);
    try {
      await updateDoc(offerDocRef, buildOfferObjectFromState());
      await sendPushNotification(expoPushToken);
      navigation.navigate('Offers');
    } catch (e) {
      console.log(e);
      Alert.alert("Error actualizando oferta");
    }
  }



  const isValidTextDate = (date_text: string) => {
    const splitted = date_text.split("-")
    if (splitted.length != 3) {
      return false;
    }

    const day = parseInt(splitted[0])
    const month = parseInt(splitted[1])
    const year = parseInt(splitted[2])

    if (month < 1 || month > 12) {
      return false;
    }

    if (year < 1900 || year > 2200) {
      return false;
    }

    if (day < 1 || day > new Date(year, month, 0).getDate()) {
      return false;
    }

    return true;
  }

  const isValidDate = (date_text: string, hour_text: string) => {
  const splitted = hour_text.split(":")
  const partesFecha = date_text.split('-');
  const fechaIntroducida = new Date(parseInt(partesFecha[2]),parseInt(partesFecha[1]) - 1, parseInt(partesFecha[0]), 
                                    parseInt(splitted[0]),parseInt(splitted[1])); 

  const fechaActual = new Date();

  if (fechaIntroducida < fechaActual) {

    return false;
  }
  return true;
  }

  const isValidScheduleText = (schedule_text: string) => {
    return schedule_text.trim().length > 0;
  }

  const isValidEducationText = (education_text: string) => {
    return education_text.trim().length > 0;
  }

  const isValidExperienceText = (experience_text: string) => {
    return experience_text.trim().length > 0;
  }

  const isValidTextHour = (hour_text: string) => {
    const splitted = hour_text.split(":")
    if (splitted.length != 2) {
      return false;
    }

    const hour = parseInt(splitted[0])
    const minutes = parseInt(splitted[1])

    if (!((hour >= 0 && hour <= 23) && (minutes >= 0 && minutes <= 59))) {
      return false;
    }

    return true;
  }

  function isValidOffer() {
    /* Validación Seccion Datos Oferta */
   /* if (!value.position || !value.company || 
        !value.schedule || 
        !value.address || !value.latitude || !value.longitude ||
        !value.registration_date) {
      error = 'Todos los campos de la seccion Datos Oferta son obligatorios.';
      return;
    }
*/
    if (!isValidScheduleText(value.schedule)) {
      error = 'Horario erroneo.';
      return;
    }

    if (!isValidTextDate(value.registration_date)) {
      error = 'Fecha de inscripción erronea. formato 01-10-2022';
      return;
    }
    /* Fin Validación Seccion Datos Oferta */

    /* Validación Seccion Requisitos */
    const needToValidateEducation = value.mandatory_education;
    if (needToValidateEducation && !value.required_education) {
      error = 'Campo formación no puede estar vacío si está activado';
      return;
    }

    const needToValidateExperience = value.mandatory_experience;
    if (needToValidateExperience && !value.required_experience) {
      error = 'Campo experiencia no puede estar vacío si está activado';
      return;
    }
    /* Fin Validación Seccion Requisitos */

    /* Validación Seccion Entrevista */
    const needToValidateInterviewDate = value.interview_date;
    if (needToValidateInterviewDate && !isValidTextDate(value.interview_date)) {
      error = 'Fecha de entrevista erronea. Formato 01-12-2020';
      return;
    }

    const needToComprobateInterviewDate = value.interview_date;
    if(needToComprobateInterviewDate && !isValidDate(value.interview_date,value.interview_hour)) {

      error = 'Fecha de entrevista erronea. Introduce una fecha mayor. ';
      return
    }

    const needToValidateInterviewHour = value.interview_hour;
    if (needToValidateInterviewHour && !isValidTextHour(value.interview_hour)) {
      error = 'Hora de entrevista erronea. formato hh:mm formato 24 horas.';
      return;
    }
    /* Fin Validación Seccion Entrevista */

    // devolvemos true si llegamos aqui
    return true;
  }


  const handleSelectAddressJob = (calle) => {
    setSelectedAddress(calle);
    setValue({
      ...value,
      address: calle.street,
      latitude: calle.latitude,
      longitude: calle.longitude,
    });
  };

  const handleSelectInterviewAddress = (calle) => {
    setSelectedInterviewAddress(calle);
    setValue({
      ...value,
      interview_address: calle.street,
      interview_latitude: calle.latitude,
      interview_longitude: calle.longitude,
    });
  };
 

  return (
    <SafeAreaView style={styles.container}>
     
      <ScrollView keyboardShouldPersistTaps="handled" style={styles.scrollView} contentContainerStyle={styles.scrollViewContentContainer}>
        <View style={styles.controls}>
          <Text style={styles.subtitle}>
            Datos Oferta *
          </Text>
          <Text>
            Puesto
          </Text>

          <Input
            autoComplete='off'
            containerStyle={styles.control}
            value={value.position}
            onChangeText={(text) => setValue({ ...value, position: text })}
          />

          <Text>
            Empresa
          </Text>

          <Input
            autoComplete='off'
            containerStyle={styles.control}
            value={value.company}
            onChangeText={(text) => setValue({ ...value, company: text })}
          />

          <Text>
            Horario
          </Text>

          <Input
            autoComplete='off'
            containerStyle={styles.control}
            value={value.schedule}
            placeholder={"Formato  hh:mm - hh:mm"}
            onChangeText={(text) => setValue({ ...value, schedule: text })}
          />

          <Text>
            Lugar
          </Text>
          <Text style={styles.control}>
            {value.address}
          </Text>

          <Autocomplete onSelect={handleSelectAddressJob} />
              {/* <Input
            autoComplete='off'
            containerStyle={styles.control}
            value={value.address}
            placeholder={"Calle Figueroa, 14, Madrid, España"}
            onChangeText={(text) => setValue({ ...value, address: text })}
  />*/}
      
{/*
          <ScrollView keyboardShouldPersistTaps="handled" horizontal={true} style={{ flex: 1, width: '100%', height: '100%' }}>
            <GooglePlacesAutocomplete
              ref={jobRefAddress}
              placeholder="Introduce ubicación del sitio de trabajo..."
              minLength={2}
              fetchDetails={true}
              debounce={300}
              query={{
                key: "AIzaSyCoh32ThA1G5ItPhvqI7U2fZ5hUhur217I",
                language: "es"
              }}
              onFail={() => {
                setValue({ ...value, address: '', latitude: undefined, longitude: undefined })
              }}
              onNotFound={() => {
                setValue({ ...value, address: '', latitude: undefined, longitude: undefined })
              }}
              onPress={(data, details) => {
                setValue({ ...value, address: data.description, latitude: details.geometry.location.lat, longitude: details.geometry.location.lng })
              }}
            />
          </ScrollView>
            */}
          <Text>
            Fecha de inscripción
          </Text>

          <Input
            autoComplete='off'
            containerStyle={styles.control}
            placeholder={"Formato dd-mm-aaaa"}
            value={value.registration_date}
            onChangeText={(text) => setValue({ ...value, registration_date: text.trim() })}
          />

          <Text style={styles.subtitle}>
            Requisitos *
          </Text>

          <View style={styles.horizontal}>
            <Text>
              Formación
            </Text>

            <Switch
              value={value.mandatory_education}
              onValueChange={(switchValue) => setValue({ ...value, mandatory_education: switchValue })}
            />
          </View>

          { value.mandatory_education &&
          <Input
            autoComplete='off'
            containerStyle={styles.control}
            value={value.required_education}
            onChangeText={(text) => setValue({ ...value, required_education: text })}
          />
          }

          <View style={styles.horizontal}>
            <Text>
              Experiencia
            </Text>
            <Switch
              value={value.mandatory_experience}
              onValueChange={(switchValue) => setValue({ ...value, mandatory_experience: switchValue })}
            />
          </View>
          {
          value.mandatory_experience && 
          <Input
            autoComplete='off'
            containerStyle={styles.control}
            value={value.required_experience}
            onChangeText={(text) => setValue({ ...value, required_experience: text })}
          />
          }
          
          <Text style={styles.subtitle}>
            Entrevista
          </Text>

          <Text>
            Fecha de entrevista
          </Text>

          <Input
            autoComplete='off'
            containerStyle={styles.control}
            placeholder={"Formato dd-mm-aaaa"}
            value={value.interview_date}
            onChangeText={(text) => setValue({ ...value, interview_date: text })}
          />

          <Text>
            Hora
          </Text>

          <Input
            autoComplete='off'
            containerStyle={styles.control}
            placeholder={"Formato hh:mm"}
            value={value.interview_hour}
            onChangeText={(text) => setValue({ ...value, interview_hour: text })}
          />

          <Text>
            Persona de contacto
          </Text>

          <Input
            autoComplete='off'
            containerStyle={styles.control}
            value={value.contact_person}
            onChangeText={(text) => setValue({ ...value, contact_person: text })}
          />

          <Text>
            Lugar
          </Text>
          <Text style={styles.control}>
            {value.interview_address}
          </Text>

          <Autocomplete onSelect={handleSelectInterviewAddress} />
         {/* <Input
            autoComplete='off'
            containerStyle={styles.control}
            value={value.interview_address}
            placeholder={"Calle Figueroa, 14, Madrid, España"}
            onChangeText={(text) => setValue({ ...value, interview_address: text })}
          />*/}

         {/* <ScrollView keyboardShouldPersistTaps="handled" horizontal={true} style={{ flex: 1, width: '100%', height: '100%' }}>
            <GooglePlacesAutocomplete
              ref={interviewRefAddress}
              placeholder="Introduce ubicación de la entrevista..."
              minLength={2}
              fetchDetails={true}
              debounce={300}
              query={{
                key: "AIzaSyCoh32ThA1G5ItPhvqI7U2fZ5hUhur217I",
                language: "es"
              }}
              onFail={() => {
                setValue({ ...value, interview_address: '', interview_latitude: undefined, interview_longitude: undefined })
              }}
              onNotFound={() => {
                setValue({ ...value, interview_address: '', interview_latitude: undefined, interview_longitude: undefined })
              }}
              onPress={(data, details) => {
                setValue({ ...value, interview_address: data.description, interview_latitude: details.geometry.location.lat, interview_longitude: details.geometry.location.lng })
              }}
            />
            </ScrollView>*/}

          <Text>
            Estado de la entrevista:
          </Text>
          <Text style = {{color: value.interview_color}}>{value.interview_state}</Text>
          <View style={styles.buttonscontainer}>
          <Button
          onPress={() => {setValue({...value, interview_state: "Programada", interview_color:'#48b93d'})}}
          title = {"Programada"}
          buttonStyle={styles.buttonProgramState}
          />
          <Button
          onPress={() => {setValue({...value, interview_state: "En Proceso", interview_color:'#3d6ab9'})}}
          title = {"En proceso"}
          buttonStyle={styles.buttonProcessState}
          />
          </View>
          <View style={styles.buttonscontainer}>
          <Button
          onPress={() => {setValue({...value, interview_state: "Finalizada", interview_color:'#eed238'})}}
          title = {"Finalizada"}
          buttonStyle={styles.buttonFinState}
          />
         <Button
          onPress={() => {setValue({...value, interview_state: "Cancelada", interview_color:'#ff2e00'})}}
          title = {"Cancelada"}
          buttonStyle={styles.buttonCancState}
          />
          </View>  

          <View style={styles.buttons}>
            <Button
              onPress={() => {
                const valid = isValidOffer()
                if (valid) {
                  isEditMode ? updateOffer() : saveNewOffer();
                }
                else {
                  Alert.alert(error);
                }
              }}
              title={ isEditMode ? 'Actualizar oferta' : 'Dar de alta oferta' }
              buttonStyle={styles.buttonSave}
              titleStyle={{ color: '#111822' }}
            />
          </View>
        </View>

        <View style={{ padding: 20 }}>

     
    </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 20,
  },

  scrollView: {
    flex: 1,
  },

  scrollViewContentContainer: {
    paddingTop: 20,
    paddingBottom: 20,
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },

  horizontal: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5
  },

  controls: {
    flex: 1,
    flexGrow: 6,
    width: '100%',
    paddingLeft: '10%',
    paddingRight: '10%'
  },

  subtitle: {
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderBottomColor: 'black',
    padding: 5,
    textAlign: 'center',
  },
  autocomplete: {
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: 13,
    marginTop: 5,
    marginEnd: 5,
    padding: 5,
   
  },

  control: {
    width: '100%',
    marginTop: 5
  },

  error: {
    marginTop: 10,
    padding: 10,
    color: '#fff',
    backgroundColor: '#d54826ff',
  },

  buttons: {
    flex: 1,
    flexGrow: 3,
  },

  buttonSave: {
    backgroundColor: '#ffa40b',
    width: '100%',
    marginTop: 50
  },
  buttonscontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  buttonProgramState:
  {
    marginTop: 20,
    backgroundColor: '#008d09'
  },

  buttonProcessState:{
    marginTop: 20,
    backgroundColor: '#019fb8'
  },
  buttonFinState:{
    backgroundColor: '#d6d41d'
  },
  buttonCancState:{
    backgroundColor: '#e91711'
  },
  addressContainer: {
    marginTop: 20,
    marginEnd: 20,
  },
  addressText: {
    fontSize: 16,
    marginBottom: 5,
  },

});

export default NewOrDetailOfferScreen;