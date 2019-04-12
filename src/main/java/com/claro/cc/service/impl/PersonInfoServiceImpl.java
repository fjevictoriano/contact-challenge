package com.claro.cc.service.impl;

import com.claro.cc.domain.Person;
import com.claro.cc.domain.User;
import com.claro.cc.repository.PersonRepository;
import com.claro.cc.repository.UserRepository;
import com.claro.cc.service.PersonInfoService;
import com.claro.cc.service.dto.PersonFullDTO;
import com.claro.cc.service.mapper.PersonFullMapper;
import com.claro.cc.service.mapper.UserMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PersonInfoServiceImpl implements PersonInfoService {

    private final Logger log = LoggerFactory.getLogger(PersonInfoServiceImpl.class);

    private final PersonRepository personRepository;
    private final PersonFullMapper personFullMapper;
    private final UserMapper userMapper;


    public PersonInfoServiceImpl(PersonRepository personRepository,
                                 PersonFullMapper personFullMapper,
                                 UserMapper userMapper) {

        this.personRepository = personRepository;
        this.personFullMapper = personFullMapper;
        this.userMapper = userMapper;
    }

    @Override
    public PersonFullDTO save(PersonFullDTO personFullDTO) {
        log.debug("Request to save PersonInfo : {}", personFullDTO);
        User user = userMapper.userFromId(personFullDTO.getUserId());
        Person person = personFullMapper.personFullDTOToPerson(personFullDTO);
        person.setUser(user);
        Person personSaved = personRepository.save(person);
        return personFullMapper.personToPersonFullDTO(personSaved);
    }
}
