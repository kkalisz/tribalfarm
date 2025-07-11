import React from "react";
import {Flex, FormLabel} from "@chakra-ui/react";
import TribalSwitch from "@src/shared/ui/TribalSwitch";

interface SettingsSwitchProps {
  label: string;
  name: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}

export const SettingsSwitch: React.FC<SettingsSwitchProps> = ({label, name, enabled, onChange}) => {
  return (
    <Flex mt={2} alignItems="center" justifyContent="space-between">
      <FormLabel htmlFor={name} mb={0}>{label}</FormLabel>
      <TribalSwitch
        id={name}
        isChecked={enabled}
        onChange={(e) => onChange(e.target.checked)}
        size="md"
      />
    </Flex>
  );
};