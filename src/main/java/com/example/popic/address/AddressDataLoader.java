package com.example.popic.address;

import com.example.popic.address.repository.AddressRepository;
import com.example.popic.entity.entities.Address;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

import java.io.File;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AddressDataLoader implements CommandLineRunner {

    private final AddressRepository addressRepository;

    @Override
    public void run(String... args) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        TypeReference<List<Address>> typeRef = new TypeReference<List<Address>>() {};
//        List<Address> addresses = mapper.readValue(new File("src/main/resources/address.json"), typeRef);
        List<Address> addresses = mapper.readValue(new File("/address.json"), typeRef);

        addressRepository.saveAll(addresses);

        System.out.println("Address table initialized!");
    }
}
