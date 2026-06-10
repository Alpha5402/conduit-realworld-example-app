import ContainerRow from "../components/ContainerRow";
import SettingsForm from "../components/SettingsForm";
import { useAuthContext } from "../context/AuthContext";

function Settings() {
  const { currentUser, updateUserInfo, logout } = useAuthContext();

  return (
    <div className="settings-page">
      <ContainerRow type="page">
        <div className="col-md-6 offset-md-3 col-xs-12">
          <h1 className="text-xs-center">Your Settings</h1>
          <SettingsForm 
            currentUser={currentUser} 
            onUpdateUser={updateUserInfo} 
            onLogout={logout} 
          />
        </div>
      </ContainerRow>
    </div>
  );
}

export default Settings;